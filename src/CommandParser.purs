module CommandParser
  ( Expr(..)
  , parse
  ) where

import Prelude
import Control.Lazy (defer)
import Data.CodePoint.Unicode (isLetter)
import Data.Either (Either)
import Data.List (List)
import Data.List as L
import Data.String as S
import Parsing (ParseError, runParser)
import Parsing as P
import Parsing.Combinators (asErrorMessage, choice, sepBy)
import Parsing.String (char, string)
import Parsing.String.Basic (intDecimal, number, skipSpaces, takeWhile, takeWhile1, whiteSpace)

type Parser
  = P.Parser String

data Expr
  = Forward Number
  | TurnLeft Number
  | TurnRight Number
  | Clear
  | Hide
  | Show
  | Background String
  | Repeat Int (List Expr)
  | PenUp
  | PenDown
  | Color String
  | Width Int
  | Define String (List Expr)
  | Call String

instance showExpr :: Show Expr where
  show (Forward x) = "forward " <> show x
  show (TurnLeft x) = "left " <> show x
  show (TurnRight x) = "right " <> show x
  show (Background x) = "background " <> x
  show Clear = "clear"
  show Hide = "hide"
  show Show = "show"
  show PenUp = "penup"
  show PenDown = "pendown"
  show (Color x) = "color " <> x
  show (Width x) = "width " <> show x
  show (Repeat x es) = "repeat " <> show x <> " [" <> joinExprs es <> "]"
  show (Define x es) = "define " <> x <> " as [" <> joinExprs es <> "]"
  show (Call x) = x

joinExprs :: List Expr -> String
joinExprs = L.foldl (\acc e -> acc <> sep acc <> show e) ""
  where
  sep s = if S.null s then "" else " "

parse :: String -> Either ParseError (List Expr)
parse = flip runParser parseExprs

parseExprs :: Parser (List Expr)
parseExprs = defer \_ -> parseExpr `sepBy` whiteSpace

parseExpr :: Parser Expr
parseExpr =
  defer \_ ->
    asErrorMessage "command"
      $ choice
          [ Forward <$> commandWithNum [ "forward", "fd" ]
          , TurnLeft <$> commandWithNum [ "left", "lt" ]
          , TurnRight <$> commandWithNum [ "right", "rt" ]
          , Clear <$ string "clear"
          , Hide <$ string "hide"
          , Show <$ string "show"
          , Background <$> commandWithString [ "background", "bg" ]
          , PenUp <$ command [ "penup", "pu" ]
          , PenDown <$ command [ "pendown", "pd" ]
          , Color <$> commandWithString [ "color" ]
          , Width <$> commandWithInteger [ "width" ]
          , parseRepeat
          , parseDefine
          , Call <$> parseIdentifier
          ]

commandWithNum :: Array String -> Parser Number
commandWithNum ss = command ss *> skipSpaces *> number

commandWithInteger :: Array String -> Parser Int
commandWithInteger ss = command ss *> skipSpaces *> intDecimal

commandWithString :: Array String -> Parser String
commandWithString ss = command ss *> skipSpaces *> takeWhile isLetter

command :: Array String -> Parser String
command = choice <<< map string

parseRepeat :: Parser Expr
parseRepeat = do
  _ <- string "repeat" <* whiteSpace
  count <- intDecimal <* skipSpaces
  exprs <- (char '[') *> parseExprs <* (char ']')
  pure $ Repeat count exprs

parseDefine :: Parser Expr
parseDefine = do
  _ <- string "define" <* whiteSpace
  identifier <- parseIdentifier <* whiteSpace
  _ <- string "as" <* whiteSpace
  exprs <- (char '[') *> parseExprs <* (char ']')
  pure $ Define identifier exprs

parseIdentifier :: Parser String
parseIdentifier = takeWhile1 isLetter
