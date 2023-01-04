const path = require('path');
module.exports = {
    entry: './src/index.js',
    output: {
			filename: 'bundle.js',
			path: path.join(__dirname, 'build/public')
    },
    module: {
			rules: [{
				loader: 'babel-loader',
				test: /\.js$/,
				exclude: /node_modules/
			}, {
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			  },
		]
    },
		mode: 'development',
		experiments: {
			asyncWebAssembly: true,
			topLevelAwait: true,
			layers: true // optional, with some bundlers/frameworks it doesn't work without
		  }
};