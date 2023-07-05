const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');


var config = {
	entry:  './src/index.js',
	  output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'build/public'),
		// Specify the folder name for the extension output
	  },
	devServer: {
		static: {
		  directory: path.join(__dirname, 'build/public'),
		},
		compress: true,
		port: 8080,
	  },
	
    module: {
			rules: [
				{
					test: /\.svg$/,
					use: ['@svgr/webpack', 'svg-url-loader'],
				  },
				{
				loader: 'babel-loader',
				test: /\.js$/,
				exclude: /node_modules/
			}, {
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			  },
		]
    },
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{ from: 'src/html', to: '' },
            ],
        }),
		new CopyWebpackPlugin({
			patterns: [
				{ from: path.join(__dirname, 'src/extension/static'), to: path.join(__dirname, 'build/extension') },
			],
		}),
    ],

	mode: 'development',
	experiments: {
		asyncWebAssembly: true,
		topLevelAwait: true,
		layers: true // optional, with some bundlers/frameworks it doesn't work without
		},
    devtool: 'source-map' // Generate source maps for better error debugging
	};

				

var extensionConfig = {
	entry:  './src/extension/extension.js',
	  output: {
		filename: 'extension.js',
		path: path.resolve(__dirname, 'build/extension'),
		// Specify the folder name for the extension output
	  },
	  mode: 'development',
	  devtool: 'source-map',
	  experiments: {
		asyncWebAssembly: false,
		topLevelAwait: false,
		layers: true // optional, with some bundlers/frameworks it doesn't work without
		},
	  module: {
		rules: [
			{
			loader: 'babel-loader',
			test: /\.js$/,
			exclude: /node_modules/
		}, {
			test: /\.css$/i,
			use: ["style-loader", "css-loader"],
		  },
	]
},
	};
	
var workerConfig = {
	entry:  './src/extension/worker.js',
	  output: {
		filename: 'worker.js',
		path: path.resolve(__dirname, 'build/extension'),
		// Specify the folder name for the extension output
	  },
	  mode: 'development',
	  devtool: 'source-map',
	  experiments: {
		asyncWebAssembly: false,
		topLevelAwait: false,
		layers: true // optional, with some bundlers/frameworks it doesn't work without
		},
		module: {
			rules: [
				{
				loader: 'babel-loader',
				test: /\.js$/,
				exclude: /node_modules/
			}]
		},
	};

module.exports =  [config, extensionConfig, workerConfig]