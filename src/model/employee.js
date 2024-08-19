import { Schema, model } from 'mongoose';

const employeeSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    position: { type: String, required: true },
    department: { type: String, required: true },
    salary: { type: Number, required: true },
    hireDate: { type: Date, default: Date.now }
});

const Employee = model('Employee', employeeSchema);

export default Employee;
