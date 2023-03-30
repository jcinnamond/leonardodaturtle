{ name = "leonardodaturtle"
, dependencies =
  [ "arrays"
  , "canvas"
  , "console"
  , "control"
  , "effect"
  , "either"
  , "exceptions"
  , "foldable-traversable"
  , "integers"
  , "lists"
  , "maybe"
  , "numbers"
  , "parsing"
  , "prelude"
  , "refs"
  , "strings"
  , "unicode"
  , "web-dom"
  , "web-events"
  , "web-html"
  ]
, packages = ./packages.dhall
, sources = [ "src/**/*.purs", "test/**/*.purs" ]
}
