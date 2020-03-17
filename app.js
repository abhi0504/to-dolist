//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://abhishek_0504:9971749520a@cluster0-b6e9z.mongodb.net/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your ToDoList"
})

const item2 = new Item({
  name: "Hit + button to add new file"
})

const item3 = new Item({
  name: "<-- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema(
  {
    name : String,
    items : [itemsSchema]
  }
)

const List = mongoose.model("List" , listSchema)

const workItems = [];



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("success");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }

  })

});


app.post("/", function(req, res) {


  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today")
  {
      item.save();
      res.redirect("/");
  }
  else{
    List.findOne({name : listName} , function(err , foundList)
  {
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
  }

});

app.post("/delete", function(req, res) {
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today")
    {
      Item.findByIdAndDelete(checkedId, function(err) {
        if (!err) {
          console.log("Success");
        }
      })

      res.redirect("/")
    }
    else
    {
      List.findOneAndUpdate({name : listName} , { $pull : {items : {_id : checkedId}}} , function(err , foundList)
      {
        if(!err)
        {
          res.redirect("/" + listName);
        }
      }

    )
}});

app.get("/:customListName" , function(req , res)
{
   const customListName = req.params.customListName;

   List.findOne({name : customListName} , function(err , foundList)
 {
   if(!err)
   {
     if(!foundList)
     {
       const list = new List(
         {
           name : customListName,
           items : defaultItems
         }
       )

       list.save();
       res.redirect("/" + customListName );
     }

     else
     {
       res.render("list", {listTitle : foundList.name , newListItems : foundList.items})
     }
   }
 });
});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
