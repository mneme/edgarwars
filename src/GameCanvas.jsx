import React from 'react'

const canvasWidth = 960
const canvasHeight = 480

const options = ['johan', 'gill', 'anders', 'peter']

const colors = {
  johan: '#F9EC37',
  gill: '#EFF5EF', 
  anders: '#35A14A',
  peter: '#009AC0'
}

const renderRect = (ctx, {x, y, width, height, color}) => {
  ctx.fillStyle = color
  ctx.fillRect(x, y, width, height)
}

const getTotalVotes = votes => Object.values(votes).reduce((sum, v) => sum + v, 0)

const getRects = (options, votes) => {
  const total = getTotalVotes(votes)
  let lastOption

  return options.reduce((result, option) => {
    const vote = votes[option ]
    const color = colors[option]

    let x = 0
    if(lastOption){
      const last = result[lastOption] 
      x = last.x + last.width + 1
    }

    const width = Math.max(50+(canvasWidth-200) * (vote/total), 50)

    const rect = {
      y: 0,
      x,
      width,
      height: canvasHeight,
      color
    }
    
    result[option] = rect
    lastOption = option
    return result
  }, {})
}

class GameCanvas extends React.Component {

  likes = {
    johan: [],
    gill: [],
    anders: [],
    peter: []
  }

  votes = { 
    johan: 0,
    gill: 0, 
    anders: 0,
    peter: 0
  }

  constructor(props) {
    super(props);
    this.animationFrameRequestId = undefined
    this.canvasRef = React.createRef();
    this.animate = true
  }

  componentDidMount() {
    this.lastIteration = Date.now()
    this.animationFrameRequestId = requestAnimationFrame(this.updateCanvas)
  }

  componeneWillUnomount(){
    if(this.animationFrameRequestId){
      cancelAnimationFrame(this.animationFrameRequestId)
    }
  }

  shouldComponentUpdate(nextProps){
    Object.entries(nextProps.likes).forEach(([prop, value]) => {
      if(!value){
        return
      }
      this.votes[prop] = this.votes[prop] += value
      this.likes[prop].push({pos: canvasHeight/2 + 60, value})
    })
    return false
  }

  updateCanvas = () => {
    try{
      const nextIteration = Date.now()
      const passed = nextIteration - this.lastIteration
      const canvas = this.canvasRef.current;
      const ctx = canvas.getContext('2d');
      const rects = getRects(options, this.votes)

      ctx.clearRect(0,0, canvasHeight, canvasWidth)

      options.forEach(option => {
        renderRect(ctx, rects[option])
        const optionLikes = this.likes[option]
        const votes = this.votes[option]
        const x = rects[option].x + rects[option].width/2 - 20

        ctx.font = "20px Courier New ";
        ctx.fillStyle = `rgba(0, 0, 0, 1)`;
        ctx.fillText(`${votes}`, rects[option].x, canvasHeight-5)

        optionLikes.forEach((like, i) =>{
          
          const nextPos = like.pos - 0.2 * passed
    
          if(nextPos < 0){
            optionLikes.splice(i, 1)
            return
          }
          
          const opacity = Math.min(Math.round(100*(nextPos / (canvasHeight/2)))/100, 1)
          ctx.fillStyle = `rgba(80, 80, 0, ${opacity})`;
          ctx.font = "30px Courier New ";
          ctx.fillText(`+${like.value}`, x, like.pos)
          like.pos = nextPos
        })
      })

      this.lastIteration = nextIteration
      this.animationFrameRequestId = requestAnimationFrame(this.updateCanvas)
    } catch (e) {
      console.log(e)
    }
  }

  render() {
    return(
      <div>
        <canvas ref={this.canvasRef} width={canvasWidth} height={canvasHeight} />
      </div>
    )
  }
}
export default GameCanvas