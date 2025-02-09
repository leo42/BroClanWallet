const path = require('path');
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const argv = require('yargs').argv;
const isProduction = argv.mode === 'production';

var webAppConfig = {
	resolve: {
		fallback: { 
			crypto: false,
			 "stream": require.resolve("stream-browserify") 
		 },
		extensions: ['.js', '.jsx', '.ts', '.tsx'],  // Add .tsx here
	},
    entry: './src/index.tsx',
    output: {
		crossOriginLoading: 'anonymous',
			filename: 'bundle.js',
			path: path.join(__dirname, 'build/public')
    },
	devServer: {
		static: {
		  directory: path.join(__dirname, 'build/public'),
		},
		compress: true,
		port: 8080,
		allowedHosts : ["localhost" , "test.broclan.io"]
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
				{
					test: /\.(ts|tsx)$/,
					use: 'ts-loader',
					exclude: /node_modules/,
				},
		]
    },
	mode : isProduction ? 'production' : 'development',
	plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/html', to: '' },
            ],
        }),
		
    ],
	devtool : 'source-map',
	optimization: {
		usedExports: true,
	  },
	experiments: {
		asyncWebAssembly: true,
		topLevelAwait: true,
		layers: true // optional, with some bundlers/frameworks it doesn't work without
		}
};

var extensionConfig = {
	entry:  './src/extension/extension.js',
	  output: {
		filename: 'extension.js',
		path: path.resolve(__dirname, 'build/extension'),
		// Specify the folder name for the extension output
	  },
	  resolve: {
		extensions: ['.js', '.jsx', '.ts', '.tsx']
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
		  {
			test: /\.(ts|tsx)$/,
			use: 'ts-loader',
			exclude: /node_modules/,
		},
		]
	},
	  plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{ from: path.join(__dirname, 'src/extension/static'), to: path.join(__dirname, 'build/extension') },
			],
		}),
],

	};
	
var workerConfig = {
	entry:  './src/extension/background.ts',
	  output: {
		filename: 'background.js',
		path: path.resolve(__dirname, 'build/extension'),
		// Specify the folder name for the extension output
	  },
	  resolve: {
		extensions: ['.js', '.jsx', '.ts', '.tsx'],
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
			},
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		]
		},
	};


	var injectionConfig = {
		entry:  './src/extension/injected.js',
		  output: {
			filename: 'injected.js',
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
	
	var approvalConfig = {
		entry:  './src/extension/approval.js',
		  output: {
			crossOriginLoading: 'anonymous',

			filename: 'approval.js',
			path: path.resolve(__dirname, 'build/extension'),
			// Specify the folder name for the extension output
		  },
		  mode: 'development',
		  resolve: {
			extensions: ['.js', '.jsx', '.ts', '.tsx'],
		  },
		  devtool: 'source-map',
		  experiments: {
			asyncWebAssembly: false,
			topLevelAwait: false,
			layers: true // optional, with some bundlers/frameworks it doesn't work without
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
				}
				,{
					test: /\.css$/i,
					use: ["style-loader", "css-loader"],
				  },
				  {
					test: /\.(ts|tsx)$/,
					use: 'ts-loader',
					exclude: /node_modules/,
				},
			]
			},
			experiments: {
				asyncWebAssembly: true,
				topLevelAwait: true,
				layers: true // optional, with some bundlers/frameworks it doesn't work without
				}
		};	
	
module.exports = [webAppConfig, extensionConfig , workerConfig, injectionConfig, approvalConfig]
if(isProduction) {
	module.exports[0].plugins.push(new HtmlWebpackPlugin({
		template: 'src/index.html' ,
		hash: true, // Add a hash to the injected script tag
		inject: 'body', // Inject the script tag in the body of the HTML file
	  }))

	module.exports[0].plugins.push(new  SubresourceIntegrityPlugin({
	hashFuncNames: ['sha256', 'sha384'], // Hash algorithms to use for SRI
	enabled: true, // Enable SRI generation
  })) 

}else{
	module.exports[0].plugins.push(new CopyWebpackPlugin({
		patterns: [
			{ from: 'src/index.dev.html', to: 'index.html' },
		],
	}))

}