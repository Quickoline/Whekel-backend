import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
  start: { type: String, required: true },
  endpoint: { type: String, required: true },
  schedule: [
    {
      time: { type: String, required: true },
      days: [{ type: String, required: true }]
    }
  ]
});

const fleetSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    name: { type: String, required: true },
    model: { type: String, required: true },
    number: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['bike', 'taxi', 'bus', 'local', 'other'],
      required: true
    },
    fuelType: {
      type: String,
      enum: ['EV', 'CNG', 'Fuel'],
      required: true
    },
    acType: {
      type: String,
      enum: ['AC', 'Non AC'],
      required: true
    },
    sleeperType: {
      type: String,
      enum: ['Sleeper', 'Non Sleeper'],
      default: 'Non Sleeper'
    },
    seatCapacity: { type: Number, required: true },
    routes: [routeSchema]
  },
  { timestamps: true }
);

const Fleet = mongoose.model('Fleet', fleetSchema);
export default Fleet;
