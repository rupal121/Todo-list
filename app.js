//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");


const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rupal:Rupal@123@cluster0.lq3fq.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema ={
  name: String
}; 
const Item = mongoose.model("item", itemsSchema);
const item1 = new Item ({
  name: "Welcome to your todolist!"
});
const item2 = new Item ({
  name: "Check the checkbox to delete item!"
});
const item3 = new Item ({
  name: "Press the add button to add new item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

Item.find({}, function(err, foundList){
  if(foundList.length === 0){
Item.insertMany(defaultItems, function(err){
  if(err){
    console.log(err);
  } else{
    console.log("Successfully added");
  }
});
res.redirect("/");
  }
  else{
  res.render("list", {listTitle: "Today", newListItems: foundList});
}

});

});

app.get("/:customListName", function(req,res){
const customListName =  _.capitalize(req.params.customListName);

List.findOne({name: customListName }, function(err, foundList){
  if(!err){
    if(!foundList){
     const list = new List({
  name: customListName,
  items: defaultItems

});
     list.save();
     res.redirect("/"+customListName);
    } else{
      res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
    }
  }
  else{
    console.log(err);
  }
});

});



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
    });

  if(listName === "Today"){
    item.save();
res.redirect("/");
} else{

List.findOne({name: listName}, function(err, foundList){
  foundList.items.push(item);
  foundList.save();
  res.redirect("/" + listName);

});
}

});
 
 app.post("/delete", function(req, res){
const checkedId = req.body.checkbox;
const listName = req.body.listName;

if(listName === "Today"){
  Item.findByIdAndRemove(checkedId, function(err){
if(!err){
  console.log("deleted");
res.redirect("/");
  
}
  });
  }
else{
  List.findOneAndUpdate({name: listName }, {$pull:{items:{_id: checkedId}}}, function(err, foundList ){
    if(!err){
      res.redirect("/" + listName);
    }
  });
}

 });



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
