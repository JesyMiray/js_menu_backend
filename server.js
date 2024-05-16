const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.static("public"));

async function getDbCollection(adAddress, dbName, dbCollectionName) {
	const client = new MongoClient(adAddress);
	await client.connect();
	const db = client.db(dbName);
	return db.collection(dbCollectionName);
}

//get all menu categories with dishes
app.get("/menu", async function(req, res) {
	const categoriesCollection = await getDbCollection("mongodb://127.0.0.1", "restaurantapp", "categories");
	const dishesCollection = await getDbCollection("mongodb://127.0.0.1", "restaurantapp", "dishes");

	const categories = await categoriesCollection.find({}).toArray();
	const dishes = await dishesCollection.find({}).toArray();

	const menu = categories.map(category => ({
		...category,
		dishes: dishes.filter(dish => dish.categoryId.toString() === category._id.toString())
	}));

	res.send(menu);
});

//add a new category
app.post("/categories", async function(req, res) {
	const category = { name: req.body.name };
	const collection = await getDbCollection("mongodb://127.0.0.1", "restaurantapp", "categories");
	const result = await collection.insertOne(category);
	res.send({ ...category, id: result.insertedId });
});

//add a new dish
app.post("/dishes", async function(req, res) {
	const dish = {
		categoryId: new ObjectId(req.body.categoryId),
		name: req.body.name,
		grams: req.body.grams,
		price: req.body.price
	};
	const collection = await getDbCollection("mongodb://127.0.0.1", "restaurantapp", "dishes");
	const result = await collection.insertOne(dish);
	res.send({ ...dish, id: result.insertedId });
});

//update a dish
app.patch("/dishes/:id", async function(req, res) {
	const collection = await getDbCollection("mongodb://127.0.0.1", "restaurantapp", "dishes");
	const result = await collection.updateOne(
		{ _id: new ObjectId(req.params.id) },
		{ $set: req.body }
	);
	res.send(result);
});

//delete a dish
app.delete("/dishes/:id", async function(req, res) {
	const collection = await getDbCollection("mongodb://127.0.0.1", "restaurantapp", "dishes");
	const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
	res.send(result);
});

// Update a category
app.patch("/categories/:id", async function(req, res) {
	const collection = await getDbCollection("mongodb://127.0.0.1", "restaurantapp", "categories");
	const result = await collection.updateOne(
		{ _id: new ObjectId(req.params.id) },
		{ $set: { name: req.body.name } }
	);
	res.send(result);
});

// Delete a category
app.delete("/categories/:id", async function(req, res) {
	const collection = await getDbCollection("mongodb://127.0.0.1", "restaurantapp", "categories");
	const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
	res.send(result);
});

app.listen(port, function() {
	console.log(`Server started on port ${port}!`);
});

