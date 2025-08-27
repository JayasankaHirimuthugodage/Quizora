import Window from "../models/quizWindowModel.js";

//get all windows controller
const getWindows = async(req, res) => {
    try{
        const windows = await Window.find({});
        res.status(200).json(windows);
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

//get one window controller
const getWindow = async(req,res) => {
    try{
        const {id} = req.params; //take id from url
        const window = await Window.findById(id)
        res.status(200).json(window);
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

//add window controller
const createWindow = async(req,res) => {
    try{
        const window =  await Window.create(req.body);
        res.status(200).json(window);
    }catch(error){
        res.status(500).json({message: error.message});
    }

}

//update product controller
const updateWindow = async(req,res) => {
    try{
        const {id} = req.params;

        const window = await Window.findByIdAndUpdate(id, req.body);

        if(!window){
            return res.status(404).json({message: "Product not found"});
        }

        const updateWindow = await Window.findById(id);
        res.status(200).json(updateWindow)

    }catch(error){
        res.status(500).json({message: error.message});
    }
}

//delete product controller
const deleteWindow = async(req,res) => {
    try{
        const {id} = req.params; 

        const window = await Window.findByIdAndDelete(id)

        if(!window){
            return res.status(404).json({message: "Window not found"});
        }

        res.status(200).json({message: "Window deleted successfully"});

    }catch(error){
        res.status(500).json({message: error.message});
    }
}

const windowController = {
  createWindow,
  getWindows,
  getWindow,
  updateWindow,
  deleteWindow
};

export default windowController;