// Basic Express server setup
const express = require("express");
const cors = require("cors");
const fs = require("node:fs").promises; // For asynchronous file writing
const path = require("node:path");
const mammoth = require('mammoth');
const app = express();
const port = 3001; // Or another port

app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// Define your API routes here
const data = require("./data/data.json");

// Docx
app.get("/api/files/:fileId", (req, res) => { 
    const list = data.files; 
    const fileMeta = list.find(file => file.id === req.params.fileId)

    if(fileMeta.filename.indexOf('.docx') > -1) { 
        try {  
            const filePath = path.join(__dirname, 'data', fileMeta.filename); 
            
            mammoth.convertToHtml({path:filePath})
              .then(function(result){
                  var html = result.value; // The generated HTML
                  var messages = result.messages; // Any messages, such as warnings during conversion

                res.send({
                data: html,
              }) 
        })
        .catch(function(error) {
            console.error(error);
        });
      } catch(err) {
        console.log("conversion error", err)
      }  
       
    } else {
      console.log("not doxc");
    }  
}); 

// PDF viewing
app.get("/api/files/:fileId/view", (req, res) => { 
    const list = data.files; 
    const fileMeta = list.find(file => file.id === req.params.fileId)
    const filePath = path.join(__dirname, 'data', fileMeta.filename); 

    if(fileMeta.filename.indexOf('.pdf') > -1) {
      console.log("pdf exist "); 

      res.setHeader('Content-Type', 'application/pdf')
      return res.sendFile(filePath); 
    } else {
      console.log(" pdf doesn't exist")
    } 

    res.status(400).json({message:"Preview not supported"}) 
}); 

app.get("/api/files", (req, res) => {
  res.json(data.files);
});

app.get("/api/files/:fileId/comments", (req, res) => {
  const fileId = req.params.fileId;
  const comments = data.comments[fileId] || [];
  res.json(comments);
});

app.post("/api/files/:fileId/comments", async (req, res) => {
  const fileId = req.params.fileId;
  const newComment = {
    id: `c${Date.now()}`, // Simple unique ID
    author: "Candidate", // You can hardcode this for the challenge
    text: req.body.text,
  };

  if (!data.comments[fileId]) {
    data.comments[fileId] = [];
  }
  data.comments[fileId].push(newComment);

  // Persist the updated data to data.json (basic implementation)
  try {
    await fs.writeFile(
      path.join(__dirname, "data", "data.json"),
      JSON.stringify(data, null, 2)
    );
    res.status(201).json(newComment); // Respond with the newly created comment
  } catch (error) {
    console.error("Error writing to data.json:", error);
    res.status(500).json({ error: "Failed to save comment" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
