# MagicMirror-GOTransit

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
	{
		module: 'gotransit',
		position: 'bottom_bar',	// This can be any of the regions.
		config: {
			// See 'Configuration options' for more information.
			line: 'LE'
		}
	}
]
````
