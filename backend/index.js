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
        
        app.post("/events", async (req, res) => {
            try {
                const event = req.body; // Get the event details from the request body
                const result = await collection.insertOne(event); // Insert the event into the database
                res.status(201).json({ message: "Event added successfully", result });
            } catch (error) {
            res.status(500).json({ message: "Failed to add event", error });
    }
});

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


    app.delete("/events/:id", async(req, res)=>{
        try {
            const id = req.params.id;
            await collection.deleteOne({ _id: new ObjectId(id) });

            res.status(201).send("Event deleted");
        } catch (error) {
            res.status(500).json({ message: "Failed to delete event", error });
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