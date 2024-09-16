const express = require("express")
const app = express ()
const Port = 8000
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.DB_CONNECTION_STRING
const { ObjectId } = require('mongodb');

app.get('/', (req, res)=>{
    res.send('Hello, World!')
})

app.use(express.json());





// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }


    try {
    
        const database = client.db('EMS');
        const collection = database.collection('events');
        const user_collection = database.collection('users');
      
        
        //create an event
        app.post("/events", async (req, res) => {
            try {
                const event = req.body; // Get the event details from the request body
                const result = await collection.insertOne(event); // Insert the event into the database
                res.status(201).json({ message: "Event added successfully", result });
            } catch (error) {
            res.status(500).json({ message: "Failed to add event", error });
        }
    });


    //modify a specific event by id
    app.put("/events/:id", async (req, res) => {
        try {
            const id = req.params.id;
            const event = req.body;
            
            // Correct usage of ObjectId with 'new'
            await collection.updateOne({ _id: new ObjectId(id) }, { $set: event });
            
            res.status(201).send("Event updated");
        } catch (error) {
            res.status(500).json({ message: "Failed to update event", error: error.message });
        }
    });


    //delete a specific event by id
    app.delete("/events/:id", async(req, res)=>{
        try {
            const id = req.params.id;
            await collection.deleteOne({ _id: new ObjectId(id) });

            res.status(201).send("Event deleted");
        } catch (error) {
            res.status(500).json({ message: "Failed to delete event", error });
        }
    })


    //Fetch all events
    app.get("/events", async (req, res) => {
        try {
            // Fetch all documents from the 'events' collection
            const events = await collection.find({}).toArray();  // You can add a filter inside find({}) if necessary
            res.status(200).json(events);  // Return the events as a JSON response
        } catch (error) {
            // Catch any error and send a 500 status code with error details
            res.status(500).json({ message: "Failed to retrieve events", error: error.message });
        }
    });
    

    //fetch specific event by id
    app.get("/events/:id", async (req, res) => {
        try {
            const id = req.params.id;
            const event = await collection.findOne({ _id: new ObjectId(id) });
    
            if (event) {
                // Event found, send it in the response
                res.status(200).json(event);
            } else {
                // Event not found, send a 404 status code
                res.status(404).json({ message: "Event not found" });
            }
        } catch (error) {
            // Handle potential errors (e.g., invalid ObjectId)
            res.status(500).json({ message: "Failed to retrieve event", error: error.message });
        }
    });
    
    



    //User Registration and Login

    app.post("/users", async (req, res)=>{
        try{
            const user = req.body;
            await user_collection.insertOne(user);
            res.status(201).json({message: "User registered succesfully"});
        } catch(error){
            res.status(500).json({message: "Failed to register user", error});
        }
    })




    

    } catch (error) {
        console.log(`Error: ${error}`)
    }
    
}
run().catch(console.dir);

app.listen(Port, ()=>{
   console.log(`Server running on ${Port}`) 
})