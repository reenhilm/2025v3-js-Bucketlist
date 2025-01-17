import path from 'path';

export default {
  entry: './scripts/index.js', // Adjust the path as needed
  output: {
    filename: 'bundle.js',
    path: path.resolve('./dist'),
  },
  mode: 'production', // or 'development'
};