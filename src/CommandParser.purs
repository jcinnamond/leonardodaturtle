module CommandParser
  ( Expr(..)
  , parse
  ) where

import Prelude
import Data.CodePoint.Unicode (isLetter)
import Data.Either (Either)
import Data.Generic.Rep (class Generic)
import Data.Show.Generic (genericShow)
import Parsing (ParseError, runParser)
import Parsing as P
import Parsing.Combinators (asErrorMessage, choice)
import Parsing.String (string)
import Parsing.String.Basic (number, skipSpaces, takeWhile)

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

derive instance genericExpr :: Generic Expr _

instance showExpr :: Show Expr where
  show = genericShow

parse :: String -> Either ParseError Expr
parse = flip runParser parseExpr

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
