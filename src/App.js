import React, {Component} from 'react';
import './App.css'; 
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import FaceRecognition from './components/FaceRecognition/FaceRecognition'; 
import Register from './components/Register/Register'; 
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Clarifai from 'clarifai';


const app = new Clarifai.App({
  apiKey: '4b04396fe1aa44e39f01b51ec5296e28' 
}); 

const particlesOptions = {
  particles: { 
      number : {
        value: 30,
        density: {
          enable: true,
          value_area: 800 
        } 
      } 
  }
}

class App extends Component { 
  constructor(){
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSingedIn: false
    }
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input}); 
    app.models
      .initModel({
        id: Clarifai.FACE_DETECT_MODEL,
      })
      .then((faceDetectModel) => {
        return faceDetectModel.predict(
          this.state.input);
      })
      .then(response => this.displayFaceBox(this.calculateFaceLocation(response)));
      // .catch(err => console.log(err);)
  }

  onRouteChange = (route) => { 
    if ( route === 'signout') {
      this.setState({isSingedIn: false})
    } else if (route === 'home') {
      this.setState({isSingedIn: true})
    }
    this.setState({route: route });
  } 
  

  render() {
    // destructuring
    const { isSingedIn, box, imageUrl, route } = this.state;
    return(
      <div className="App"> 
        <Particles 
          params={particlesOptions}
          className="particles"
          /> 
        <Navigation 
          onRouteChange = {this.onRouteChange} 
          isSingedIn = {isSingedIn}
        />
        { route === 'home' ?
          <div>
            <Logo />
            <Rank />
            <ImageLinkForm 
              onInputChange = {this.onInputChange}
              onButtonSubmit = {this.onButtonSubmit} 
            /> 
            <FaceRecognition 
              box = {box}
              imageUrl = {imageUrl}
              /> 
          </div> 
          : (
            route === 'signin' 
              ? <Signin onRouteChange = {this.onRouteChange}/> :
              <Register onRouteChange = {this.onRouteChange} /> 
          ) 
        } 
      </div>
    );
  }
}

export default App;
