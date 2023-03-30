# Leonardo da Turtle

A [logo](https://en.wikipedia.org/wiki/Logo_(programming_language))-inspired programming/drawing environment written in purescript.

## Commands

Leonardo understands the following commands:

### Basic movement
  - `forward <distance>` (alias: `fd`) -- move forward by `distance` pixels
  - `left <angle>` (alias: `lt`) -- turn left by `angle` degrees
  - `right <angle>` (alias: `rt`) -- turn right by `angle` degrees

### Configuring Leonardo
  - `penup` (alias: `pu`) -- lift the pen, meaning that Leonardo will move without drawing
  - `pendown` (alias: `pd`) -- lower the pen, meaning that Leonardo will draw when moving (this is the default)
  - `color <name>` -- change the pen color to [one of the available](https://www.w3schools.com/colors/colors_names.asp) colors
  - `width <size>` -- change the line width to `<size>`

### Configuring the canvas
  - `background <name>` (alias: `bg`) -- set the canvas background color
  - `clear` -- clear the canvas

### Advanced commands
  - `repeat <count> [<commands>]` -- repeat the `<commands>` for `<count>` times. For example, to draw a square

  ```
  repeat 4 [fd 10 rt 90]
  ```

  - `define <name> as [<commands]` -- remember `<commands>` as `<name>`. You can then use `<name>` to recall those commands. For example
  ```
  define square as [repeat 4 [fd 10 rt 90]]
  square
  ```