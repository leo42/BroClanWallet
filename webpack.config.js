const path = require('path');
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const argv = require('yargs').argv;
const isProduction = argv.mode === 'production';



module.exports = {
    entry: './src/index.js',
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
	mode : isProduction ? 'production' : 'development',
	plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/html', to: '' },
            ],
        }),
		
    ],
	devtool : 'source-map',
	experiments: {
		asyncWebAssembly: true,
		topLevelAwait: true,
		layers: true // optional, with some bundlers/frameworks it doesn't work without
		}
};

if(isProduction) {
	module.exports.plugins.push(new HtmlWebpackPlugin({
		template: 'src/index.html' ,
		hash: true, // Add a hash to the injected script tag
		inject: 'body', // Inject the script tag in the body of the HTML file
	  }))

	module.exports.plugins.push(new  SubresourceIntegrityPlugin({
	hashFuncNames: ['sha256', 'sha384'], // Hash algorithms to use for SRI
	enabled: true, // Enable SRI generation
  })) 

}else{
	module.exports.plugins.push(new CopyWebpackPlugin({
		patterns: [
			{ from: 'src/index.dev.html', to: 'index.html' },
		],
	}))

}