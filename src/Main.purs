module Main where

import Prelude
import CommandParser (Expr(..), parse)
import Data.Array (snoc)
import Data.Either (Either(..))
import Data.Foldable (traverse_)
import Data.Int (toNumber)
import Data.List (List)
import Data.List as L
import Data.Map (Map)
import Data.Map as M
import Data.Maybe (Maybe(..))
import Data.Number (cos, pi, sin)
import Effect (Effect)
import Effect.Exception (throw)
import Effect.Ref (Ref)
import Effect.Ref as Ref
import Graphics.Canvas (CanvasElement, Context2D, arc, clearRect, closePath, fillPath, fillRect, getCanvasDimensions, getCanvasElementById, getCanvasHeight, getCanvasWidth, getContext2D, getImageData, lineTo, moveTo, putImageData, setCanvasHeight, setCanvasWidth, setFillStyle, setLineWidth, setStrokeStyle, strokePath, withContext)
import Web.DOM (Element, NonElementParentNode)
import Web.DOM.Element (clientHeight, clientWidth, toEventTarget)
import Web.DOM.NonElementParentNode (getElementById)
import Web.Event.Event (Event, EventType(..))
import Web.Event.EventTarget (addEventListener, eventListener)
import Web.HTML (HTMLInputElement, HTMLTextAreaElement, Window, window)
import Web.HTML.HTMLDocument (toNonElementParentNode)
import Web.HTML.HTMLInputElement (setValue, value)
import Web.HTML.HTMLInputElement as InputElement
import Web.HTML.HTMLTextAreaElement as TextAreaElement
import Web.HTML.Window (document)
import Web.HTML.Window as Window

type Doc
  = { window :: Window
    , form :: Element
    , input :: HTMLInputElement
    , output :: HTMLTextAreaElement
    , canvas :: CanvasElement
    , canvasCtx :: Context2D
    }

type Line
  = { from :: Point
    , to :: Point
    , color :: String
    , width :: Int
    }

type World
  = { turtle :: Turtle
    , bg :: String
    , lines :: Array Line
    , definitions :: Definitions
    }

type Turtle
  = { position :: Point
    , angle :: Number -- in radians
    , visible :: Boolean
    , drawing :: Boolean
    , color :: String
    , width :: Int
    }

type Definitions
  = Map String (List Expr)

type Point
  = { x :: Number, y :: Number }

drawTurtle :: Turtle -> Context2D -> Effect Unit
drawTurtle { position, angle } ctx =
  withContext ctx do
    fillPath ctx do
      arc ctx
        { x: position.x
        , y: position.y
        , radius: 10.0
        , start: pi + angle
        , end: 0.0 + angle
        , useCounterClockwise: false
        }

drawLines :: Array Line -> Doc -> Effect Unit
drawLines lines doc = traverse_ (drawLine doc.canvasCtx) lines
  where
  drawLine ctx { from, to, color, width } = do
    strokePath ctx
      $ do
          moveTo ctx from.x from.y
          setLineWidth ctx (toNumber width)
          setStrokeStyle ctx color
          lineTo ctx to.x to.y
          closePath ctx

moveTurtle :: World -> Number -> Effect World
moveTurtle w n =
  pure
    w
      { turtle = move w.turtle n
      , lines = addLine w.lines w.turtle n
      }
  where
  move :: Turtle -> Number -> Turtle
  move t distance = t { position = newPos t.position t.angle distance }

  addLine :: Array Line -> Turtle -> Number -> Array Line
  addLine ls { position, angle, drawing, color, width } distance
    | drawing = snoc ls { from: position, to: newPos position angle distance, color: color, width: width }
    | otherwise = ls

newPos :: Point -> Number -> Number -> Point
newPos { x, y } angle len = { x: x', y: y' }
  where
  x' = x + (sin angle * len)

  y' = y - (cos angle * len)

turn :: World -> Number -> Effect World
turn w n = pure w { turtle = turnTurtle w.turtle n }
  where
  turnTurtle :: Turtle -> Number -> Turtle
  turnTurtle t angle = t { angle = t.angle + radians angle }

radians :: Number -> Number
radians x = x * pi / 180.0

setVisible :: World -> Boolean -> World
setVisible w isVisible = w { turtle = w.turtle { visible = isVisible } }

render :: Doc -> World -> Effect Unit
render doc w = do
  clearCanvas
  drawLines w.lines doc
  if w.turtle.visible then drawTurtle w.turtle doc.canvasCtx else pure unit
  where
  clearCanvas :: Effect Unit
  clearCanvas = do
    width <- getCanvasWidth doc.canvas
    height <- getCanvasHeight doc.canvas
    withContext doc.canvasCtx do
      clearRect doc.canvasCtx { x: 0.0, y: 0.0, width: width, height: height }
      setFillStyle doc.canvasCtx w.bg
      fillRect doc.canvasCtx { x: 0.0, y: 0.0, width: width, height: height }

error :: Doc -> String -> Effect Unit
error doc s = output doc $ "!!! " <> s

output :: Doc -> String -> Effect Unit
output doc s = do
  v <- TextAreaElement.value doc.output
  TextAreaElement.setValue (v <> "\n" <> s) doc.output

handleCommand :: Ref World -> Doc -> Event -> Effect Unit
handleCommand wr doc _ = do
  v <- value doc.input
  setValue "" doc.input
  case parse v of
    Left err -> error doc $ show err
    Right commands -> do
      w' <- evalCommands true doc commands =<< Ref.read wr
      Ref.write w' wr
      render doc w'

evalCommands :: Boolean -> Doc -> List Expr -> World -> Effect World
evalCommands showOutput doc commands w
  | L.null commands = pure w
  | otherwise = L.foldM go w commands
    where
    go :: World -> Expr -> Effect World
    go w' e = do
      if showOutput then (output doc $ show e) else pure unit
      eval doc e w'

eval :: Doc -> Expr -> World -> Effect World
eval _ (Forward n) w = moveTurtle w n

eval _ (TurnLeft angle) w = turn w (angle * -1.0)

eval _ (TurnRight angle) w = turn w angle

eval doc Clear _ = initialWorld doc

eval _ (Background color) w = pure $ w { bg = color }

eval _ Show w = pure $ setVisible w true

eval _ Hide w = pure $ setVisible w false

eval _ PenUp w = pure $ w { turtle { drawing = false } }

eval _ PenDown w = pure $ w { turtle { drawing = true } }

eval _ (Color c) w = pure $ w { turtle { color = c } }

eval _ (Width n) w = pure $ w { turtle { width = n } }

eval doc (Repeat c exprs) w = evalRepeatedly c doc exprs w

eval _ (Define ident exprs) w = evalDefine ident exprs w

eval doc (Call ident) w = evalCall doc ident w

evalRepeatedly :: Int -> Doc -> List Expr -> World -> Effect World
evalRepeatedly c doc commands w
  | c < 1 = pure w
  | otherwise = evalCommands false doc commands w >>= evalRepeatedly (c - 1) doc commands

evalDefine :: String -> List Expr -> World -> Effect World
evalDefine ident exprs w = pure $ w { definitions = d' }
  where
  d' = M.insert ident exprs w.definitions

evalCall :: Doc -> String -> World -> Effect World
evalCall doc ident w = do
  case M.lookup ident w.definitions of
    Nothing -> do
      error doc ("unrecognised command " <> ident)
      pure w
    Just commands -> evalCommands false doc commands w

listenToCommands :: Ref.Ref World -> Doc -> Effect Unit
listenToCommands tr doc = do
  listener <- eventListener $ handleCommand tr doc
  addEventListener (EventType "submit") listener false (toEventTarget doc.form)

listenToResize :: Doc -> Effect Unit
listenToResize doc = do
  listener <- eventListener $ (\_ -> resizeCanvas doc)
  addEventListener (EventType "resize") listener false (Window.toEventTarget doc.window)

setupDoc :: Effect Doc
setupDoc = do
  win <- window
  doc <- toNonElementParentNode <$> (document win)
  form <- mustFindElem "command-form" doc
  inputElem <- mustFindElem "command" doc
  input <- case InputElement.fromElement inputElem of
    Nothing -> throw "cannot get HTML Input Element"
    Just e -> pure e
  outputElem <- mustFindElem "output" doc
  out <- case TextAreaElement.fromElement outputElem of
    Nothing -> throw "cannot get HTML Output Element"
    Just e -> pure e
  maybeCanvas <- getCanvasElementById "canvas"
  canvas <- case maybeCanvas of
    Nothing -> throw "cannot get canvas"
    Just c -> pure c
  ctx <- getContext2D canvas
  pure
    $ { window: win
      , form: form
      , input: input
      , output: out
      , canvas: canvas
      , canvasCtx: ctx
      }

mustFindElem :: String -> NonElementParentNode -> Effect Element
mustFindElem id doc = do
  maybeElem <- getElementById id doc
  case maybeElem of
    Nothing -> throw $ "cannot find element: " <> id
    Just e -> pure e

initialTurtle :: CanvasElement -> Effect Turtle
initialTurtle canvas = do
  width <- getCanvasWidth canvas
  height <- getCanvasHeight canvas
  pure
    { position: { x: width / 2.0, y: height / 2.0 }
    , angle: 0.0
    , visible: true
    , drawing: true
    , color: "black"
    , width: 1
    }

initialWorld :: Doc -> Effect World
initialWorld doc = do
  turtle <- initialTurtle doc.canvas
  pure { turtle: turtle, bg: "white", lines: [], definitions: M.empty }

resizeCanvas :: Doc -> Effect Unit
resizeCanvas doc = do
  -- remember the canvas contents
  d <- getCanvasDimensions doc.canvas
  content <- getImageData doc.canvasCtx 0.0 0.0 d.width d.height
  -- Shrink the canvas to get an accurate size for the canvas container. This is
  -- important when handling a resize that makes the window smaller.
  setCanvasWidth doc.canvas 1.0
  setCanvasHeight doc.canvas 1.0
  -- Now work out what the real size should be.
  root <- toNonElementParentNode <$> (document =<< window)
  e <- mustFindElem "canvas-container" root
  width <- clientWidth e
  height <- clientHeight e
  setCanvasWidth doc.canvas width
  setCanvasHeight doc.canvas height
  putImageData doc.canvasCtx content 0.0 0.0
  pure unit

main :: Effect Unit
main = do
  doc <- setupDoc
  resizeCanvas doc
  world <- initialWorld doc
  wr <- Ref.new world
  render doc world
  listenToResize doc
  listenToCommands wr doc
