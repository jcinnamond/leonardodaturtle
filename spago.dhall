{ name = "leonardodaturtle"
, dependencies =
  [ "arrays"
  , "canvas"
  , "console"
  , "effect"
  , "either"
  , "exceptions"
  , "foldable-traversable"
  , "lists"
  , "maybe"
  , "numbers"
  , "parsing"
  , "prelude"
  , "refs"
  , "unicode"
  , "web-dom"
  , "web-events"
  , "web-html"
  ]
, packages = ./packages.dhall
, sources = [ "src/**/*.purs", "test/**/*.purs" ]
}
