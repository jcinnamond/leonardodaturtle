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
  , "ordered-collections"
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
