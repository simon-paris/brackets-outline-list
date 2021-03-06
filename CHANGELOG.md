# Change Log
All notable changes to this project will be documented in this file.
This project tries to adhere to [Semantic Versioning](http://semver.org/).

## Unreleased
### Added
- Support for arrow functions in JavaScript
- Support for ES6 generator functions in JavaScript
- Detect PHP &-functions
- Detect static functions in PHP

### Fixed
- Allow all characters in PHP function arguments
- Skip CSS lines with more than 1000 characters

### Changed
- Update to Brackets 1.2 API


## 0.5.1 - 2015-02-13
### Fixed
- Actually use translated strings
- Match correct properties to XML elements if multiple elements in one line


## 0.5.0 - 2015-02-10
### Added
- Support for XML namespaces
- Hiding Animation in Sidebar mode to reduce missclicking

### Fixed
- Recognize CSS declarations where the open brace is on the next line (see [#5](https://github.com/Hirse/brackets-outline-list/issues/5)), thanks to [__@giovannicalo__](https://github.com/giovannicalo)
- Outline Indentation for XML files that use tabs for indentation, thanks to [__@giovannicalo__](https://github.com/giovannicalo)
- Assigning correct id or classes to XML elements in outline

## 0.4.6 - 2015-01-30
### Changed
- Improved method detection for CoffeeScript, thanks to [__@giovannicalo__](https://github.com/giovannicalo)


## 0.4.5 - 2015-01-21
### Fixed
- Recognize PHP functions with default values for parameter that involve parens. (see [#21](https://github.com/Hirse/brackets-outline-list/issues/21)).


## 0.4.4 - 2015-01-09
### Changed
- Updated Ionicons to version 2.0.0


## 0.4.3 - 2014-12-20
### Added
- French Translation, thanks to [__@cedced19__](https://github.com/cedced19)


## 0.4.2 - 2014-12-15
### Changed
- Remove HMTL elements from the outline that are not in the beginning of the line (see #12)


## 0.4.1 - 2014-12-14
### Fixed
- Detect PHP functions with referenced parameters (see #16)


## 0.4.0 - 2014-12-11
### Changed
- New Settings UI (Imitating Brackets Working Set Design)

### Added
- XML, HTML and SVG Support


## 0.3.1 - 2014-12-05
### Changed
- Better detection for PHP
- Visibility Icons for PHP


## 0.3.0 - 2014-12-04
### Added
- Markdown Support

### Changed
- Auto-hide Outline Pane for unsupported languages (see #10)


## 0.2.1 - 2014-12-02
### Fixed
- Detaching global Event Handlers makes other Extensions unusable (see #3, #4)


## 0.2.0 - 2014-12-01
### Added
- CofeeScript Support


## 0.1.1 - 2014-11-30
### Added
- CSS Icon for Attribute Selectors

### Changed
- Sorting disabled by default

### Fixed
- Collision with [Extensions Toolbar Reposition](https://github.com/dnbard/extensions-toolbar) (see #1)
- Sorting of Functions now works as intended
