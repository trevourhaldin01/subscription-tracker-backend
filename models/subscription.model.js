import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    name: {
        type:String,
        required: [true, "Suscription name is required"],
        trim: true,
        minLength: 2,
        maxLength:100,
    },
    price:{
        type:Number,
        required: [true, "Subscription price is required"],
        min: [0, "price must be greater than zero"],

    },
    currency: {
        type:String,
        enum:["USD","UGX","EUR","GBP"],
        default:"USD"
    },
    frequency:{
        type:String,
        enum:["daily",'weekly','monthly','yearly'],
    },
    category:{
        type:String,
        enum:['sports','news','entertainment','lifestyle','technology','finance','politics','other'],
        required: true,
    },
    paymentMethod:{
        type:String,
        required:true,
        trim:true,   
    },
    status: {
        type:String,
        enum:['active','cancelled','expired'],
        default:'active'
    },
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: (value)=> value <= new Date(),
            message: "Start date must be in the past"
        }
    },
    renewalDate: {
        type: Date,
        validate: {
            validator: function(value){ //arrow function might not work with this keyword
                return value > this.startDate
            },    
            message: "renewal date must be after the past date"
        }
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
        index:true,
    }


},{timestamps:true});

//auto-calculate renewal date if missing
subscriptionSchema.pre('save',function(next){
    if (!this.renewalDate){
        const renewalPeriods = {
            daily:1,
            weekly:7,
            monthly:30,
            yearly:365

        };

        this.renewalDate = new Date(this.startDate);
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.frequency]);
    }

    // auto update status if renewal date has passed
    if(this.renewalDate < new Date()){
        this.status = 'expired';
    }

    next();
})

const Subscription = mongoose.model('SUbscription',subscriptionSchema);

export default Subscription;