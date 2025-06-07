import mongoose from 'mongoose';

mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret._id;
  },
});

mongoose.set('toObject', {
  virtuals: true,
});

export const connectMongoDB = async (uri?: string) => {
  const conn = mongoose
    .connect(uri || process.env.NX_MONGO_URL || '', {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => mongoose);

  await conn;
  return conn;
};

// connection status logging
mongoose.connection.on('connecting', () => {
  console.log('MongoDB connecting...');
});
mongoose.connection.on('connected', () => {
  console.log('MongoDB Connected!');
});
mongoose.connection.on('disconnecting', () => {
  console.log('MongoDB Disconnecting...');
});
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB Disconnected!');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
  mongoose.connection.on('close', () => {
    console.log('MongoDB Connection Closed!');
    process.exit(0);
  });
});

export * from './lib/index';
export default mongoose;
