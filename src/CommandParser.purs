module CommandParser
  ( Expr(..)
  , parse
  ) where

import Prelude
import Data.CodePoint.Unicode (isLetter)
import Data.Either (Either)
import Data.List (List)
import Parsing (ParseError, runParser)
import Parsing as P
import Parsing.Combinators (asErrorMessage, choice, sepBy)
import Parsing.String (string)
import Parsing.String.Basic (number, skipSpaces, takeWhile, whiteSpace)

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

instance showExpr :: Show Expr where
  show (Forward x) = "forward " <> show x
  show (TurnLeft x) = "left " <> show x
  show (TurnRight x) = "right " <> show x
  show (Background x) = "background " <> show x
  show Clear = "clear"
  show Hide = "hide"
  show Show = "show"

parse :: String -> Either ParseError (List Expr)
parse = flip runParser parseExprs

parseExprs :: Parser (List Expr)
parseExprs = parseExpr `sepBy` whiteSpace

parseExpr :: Parser Expr
parseExpr =
  asErrorMessage "unrecognised command"
    $ choice
        [ Forward <$> parseNum [ "forward", "fd" ]
        , TurnLeft <$> parseNum [ "left", "lt" ]
        , TurnRight <$> parseNum [ "right", "rt" ]
        , Clear <$ string "clear"
        , Hide <$ string "hide"
        , Show <$ string "show"
        , Background <$> parseBackground
        ]

parseNum :: Array String -> Parser Number
parseNum ss = command ss *> skipSpaces *> number

parseBackground :: Parser String
parseBackground = command [ "background", "bg" ] *> skipSpaces *> takeWhile isLetter

command :: Array String -> Parser String
command = choice <<< map string
