//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true, useUnifiedTopology: true})
 
const itemsSchema = {
  name:String
}

const Item = mongoose.model("Item",itemsSchema)
 const item1 = new Item({
name:"Welcome to your to do list!"
 })
 const item2 = new Item({
  name:"Hit the + button to add a new item."
   })
   const item3 = new Item({
    name:"<-- Hit this to delete an item."
     })

      const defaultItems = [item1,item2,item3];
   const listSchema = {
     name:String,
     items:[itemsSchema]
   };
   const List = mongoose.model("List",listSchema)
app.get("/", function(req, res) {
 Item.find({},function(err,foundItems){
   if(foundItems.length === 0){
   Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err)
        }else{
          console.log("Successfully saved default items to DB.")
        }
      })
      res.redirect("/")
   }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
   }
   
 })

});
app.get("/:customListName",function(req, res){
  const customListName= _.capitalize(req.params.customListName)

List.findOne({name:customListName},function(err,results){
if(!err){
  if(!results){
   
    // create a new list 
    const list = new List({
      name: customListName,
      items:defaultItems
    })
     list.save()
     res.redirect("/" + customListName)
}else{
  //show an exising list
   res.render("list", {listTitle:results.name, newListItems:results.items})
}
}
})

})
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;
  const item = new Item({
    name:itemName
  })
  if(listName === "Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name:listName}, function(err,results){
      results.items.push(item);
      results.save();
      res.redirect("/"+listName)
    })
  }

});
app.post("/delete", function(req, res){
let checked = req.body.checkbox
let listName = req.body.listName
if(listName === "Today"){
  Item.findByIdAndRemove(checked, function(err){
    if(!err) {
      console.log("Successfully deleted checked item.")
      res.redirect("/")
    }else{
      console.log(err)
    }
   })
   
}else{
List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checked}}},function(err,results){
  if(!err) {
    res.redirect("/" + listName)
  }
})
}
})
app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
