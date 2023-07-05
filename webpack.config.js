const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
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
	plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/html', to: '' },
            ],
        }),
    ],

	mode: 'development',
	devtool : 'source-map',
	experiments: {
		asyncWebAssembly: true,
		topLevelAwait: true,
		layers: true // optional, with some bundlers/frameworks it doesn't work without
		}
};