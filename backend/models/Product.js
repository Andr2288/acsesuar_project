const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { 
    type: Number, 
    required: true, 
    min: [0, 'Ціна не може бути від’ємною'] 
  },
  category: { type: String, default: 'other' },
  imagePath: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
