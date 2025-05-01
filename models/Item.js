const mongoose = require("mongoose");



const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: {type: String, enum: ['lost', 'found'], required: true },
    contactPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Connect to the User model
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);

//Automatically set contact person to an admin user
itemSchema.pre("save", async function (next) {
  if (!this.contactPerson) {
    const adminUser = await mongoose.model("User").findOne({ role: "admin" });
    if (adminUser) {
      this.contactPerson = adminUser._id;
    }
  }
  next();
});

module.exports = mongoose.model("Item", itemSchema);
