import { Schema, model} from "mongoose";

const EmployeeSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    position: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
});

const Employee = model('Employee', employeeSchema);

export default Employee;