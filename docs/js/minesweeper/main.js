let nodes = [
 {name:"mine",image:"💣" ,back:"■"},
 {name:"none",image:"□"  ,back:"■"}
]

const FindMine = (nodelist , node) => {
  let arounds = nodelist.filter((n)=>{return n.props.x==(node.props.x - 1 )||n.props.y==(node.props.y - 1)})
  return arounds.filter( (a) => {return a.props.name == "mine"}) ;
}

class NodeClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opened: false,
    }
    this.onClick = this.onClick.bind(this);
  }
  onClick(e){
    if(this.props.name == "mine"){
      
    }else{
      let arroundMine = FindMine(nodeElements,this);
      this.setState ({image : arroundMine.length });
    }
    
    this.setState({opened:true});
  }
  render() {
    return (
       React.createElement('button', {onClick: this.onClick },
        React.createElement('span', {value: this.props.opened }, this.state.opened ? this.props.image : this.props.back))
    );
  }

};



let genNodeElement = (size = size, bomb_per = 10) => {
  let nodeItemElements = [];
  for(var y = 0; y < size; y++){
    for(var x = 0; x < size; x++){
      let isbomb = Math.floor(Math.random()*100) < bomb_per ? true:false;
      // console.log(y * size + x );
      if(isbomb){
        let item = nodes[0];
        item.key =  x + "," + y;
        item.x = x;
        item.y = y;
        item.opened = false;
        nodeItemElements.push ( React.createElement(NodeClass,item))
      }else{
        let item = nodes[1];
        item.key =  x + "," + y;
        item.x = x;
        item.y = y;
        item.opened = false;
        nodeItemElements.push ( React.createElement(NodeClass,item))
      }
    }
    nodeItemElements.push(React.createElement('br',{key:"br"+y}));
  }
  return nodeItemElements;
}

nodeElements = genNodeElement(9,10);

let rootElement =
  React.createElement('div', {}, 
    React.createElement('div', {}, nodeElements )
  )

ReactDOM.render(rootElement, document.getElementById('react-app'))