import mongoose from 'mongoose';

const stopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  lat: { type: Number },
  lng: { type: Number }
});

const busScheduleSchema = new mongoose.Schema({
  start: { type: String },
  endpoint: { type: String },
  schedule: [
    {
      time: { type: String },
      days: [{ type: String }]
    }
  ]
});

const rideSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAuth', required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    vehicleType: {
      type: String,
      enum: ['bike', 'taxi', 'bus', 'local', 'other'],
      required: true
    },
    vehicleName: { type: String, default: 'Standard Vehicle' },
    pickup: { type: String, required: true },
    drop: { type: String, required: true },
    stops: [stopSchema],
    fare: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    busSchedule: busScheduleSchema
  },
  { timestamps: true }
);

const Ride = mongoose.model('Ride', rideSchema);
export default Ride;
