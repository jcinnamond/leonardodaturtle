module Main where

import Prelude
import Data.Array (snoc)
import Data.Foldable (traverse_)
import Data.List (List(..), fromFoldable, (:))
import Data.Maybe (Maybe(..))
import Data.Number (fromString, sin, cos, pi)
import Data.String.Utils (words)
import Effect (Effect)
import Effect.Console (log)
import Effect.Exception (throw)
import Effect.Ref (Ref)
import Effect.Ref as Ref
import Graphics.Canvas (CanvasElement, Context2D, arc, clearRect, closePath, fillPath, fillRect, getCanvasElementById, getCanvasHeight, getCanvasWidth, getContext2D, lineTo, moveTo, setCanvasHeight, setCanvasWidth, setFillStyle, strokePath, withContext)
import Web.DOM (Element, NonElementParentNode)
import Web.DOM.Element (clientHeight, clientWidth, toEventTarget)
import Web.DOM.NonElementParentNode (getElementById)
import Web.Event.Event (Event, EventType(..))
import Web.Event.EventTarget (addEventListener, eventListener)
import Web.HTML (HTMLInputElement, window)
import Web.HTML.HTMLDocument (toNonElementParentNode)
import Web.HTML.HTMLInputElement (fromElement, setValue, value)
import Web.HTML.Window (document)

type Doc
  = { form :: Element
    , input :: HTMLInputElement
    , canvas :: CanvasElement
    , canvasCtx :: Context2D
    }

type Line
  = { from :: Point
    , to :: Point
    }

type World
  = { turtle :: Turtle
    , bg :: String
    , lines :: Array Line
    }

type Turtle
  = { position :: Point
    , angle :: Number -- in radians
    , visible :: Boolean
    }

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
  drawLine ctx { from, to } = do
    strokePath ctx
      $ do
          moveTo ctx from.x from.y
          lineTo ctx to.x to.y
          closePath ctx

moveTurtle :: World -> Number -> Effect World
moveTurtle w n =
  pure
    w
      { turtle = move w.turtle n
      , lines = addLine w.lines w.turtle.position w.turtle.angle n
      }
  where
  move :: Turtle -> Number -> Turtle
  move t distance = t { position = newPos t.position t.angle distance }

  addLine :: Array Line -> Point -> Number -> Number -> Array Line
  addLine ls from angle distance = snoc ls { from: from, to: newPos from angle distance }

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

leftCommand :: World -> String -> Effect World
leftCommand w s = do
  case fromString s of
    Nothing -> error "expected number when turning left" *> pure w
    Just n -> turn w (n * -1.0)

rightCommand :: World -> String -> Effect World
rightCommand w s = do
  case fromString s of
    Nothing -> error "expected number when turning right" *> pure w
    Just n -> turn w n

moveCommand :: World -> String -> Effect World
moveCommand w s = do
  case fromString s of
    Nothing -> error "expected number when moving" *> pure w
    Just n -> moveTurtle w n

clearCommand :: Doc -> Effect World
clearCommand doc = initialWorld doc

showCommand :: World -> Effect World
showCommand w = pure $ w { turtle = w.turtle { visible = true } }

hideCommand :: World -> Effect World
hideCommand w = pure $ w { turtle = w.turtle { visible = false } }

bgCommand :: World -> String -> Effect World
bgCommand w bg = pure $ w { bg = bg }

error :: String -> Effect Unit
error = log

handleCommand :: Ref World -> Doc -> Event -> Effect Unit
handleCommand wr doc _ = do
  v <- value doc.input
  setValue "" doc.input
  w' <- eval (fromFoldable $ words v) =<< Ref.read wr
  Ref.write w' wr
  render doc w'

eval :: List String -> World -> Effect World
eval Nil w = pure w

eval ("move" : distance : ss) w = moveCommand w distance >>= eval ss

eval ("left" : angle : ss) w = leftCommand w angle >>= eval ss

eval ("right" : angle : ss) w = rightCommand w angle >>= eval ss

-- eval ("clear" : ss) _ = clearCommand >>= eval ss
eval ("hide" : ss) w = hideCommand w >>= eval ss

eval ("show" : ss) w = showCommand w >>= eval ss

eval ("bg" : color : ss) w = bgCommand w color >>= eval ss

eval ss w = (error $ "unrecognised command " <> show ss) *> pure w

listenToCommands :: Ref.Ref World -> Doc -> Effect Unit
listenToCommands tr doc = do
  listener <- eventListener $ handleCommand tr doc
  addEventListener (EventType "submit") listener false (toEventTarget doc.form)

setupDoc :: Effect Doc
setupDoc = do
  doc <- toNonElementParentNode <$> (document =<< window)
  form <- mustFindElem "command-form" doc
  inputElem <- mustFindElem "command" doc
  input <- case fromElement inputElem of
    Nothing -> throw "cannot get HTML Input Element"
    Just e -> pure e
  maybeCanvas <- getCanvasElementById "canvas"
  canvas <- case maybeCanvas of
    Nothing -> throw "cannot get canvas"
    Just c -> pure c
  ctx <- getContext2D canvas
  pure
    $ { form: form
      , input: input
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
  pure { position: { x: width / 2.0, y: height / 2.0 }, angle: 0.0, visible: true }

initialWorld :: Doc -> Effect World
initialWorld doc = do
  turtle <- initialTurtle doc.canvas
  pure { turtle: turtle, bg: "white", lines: [] }

resizeCanvas :: Doc -> Effect Unit
resizeCanvas doc = do
  root <- toNonElementParentNode <$> (document =<< window)
  e <- mustFindElem "canvas" root
  width <- clientWidth e
  height <- clientHeight e
  setCanvasWidth doc.canvas width
  setCanvasHeight doc.canvas height
  pure unit

main :: Effect Unit
main = do
  doc <- setupDoc
  resizeCanvas doc
  world <- initialWorld doc
  wr <- Ref.new world
  render doc world
  listenToCommands wr doc
