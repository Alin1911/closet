import './Hero.css'
import Carousel from 'react-material-ui-carousel'
import { Paper } from '@mui/material'


 const Hero = ({closets}) => {
  return (
    <div>
        <Carousel className='closet-carousel-container'>
            {
                closets.map((closet) =>{
                     return (
                        <Paper>
                            <div className='closet-carousel-container'>
                                <div className='closet-card' style={{"--img": `url(${closet.backdrops[0]})`}}>
                                    <div className='closet-detail'>
                                        <div className='closet-poster'>
                                            <img src={closet.poster} alt="" />
                                        </div>
                                        <div className='closet-title'>
                                            <h3>{closet.title}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Paper>
                     )
                })
            }
        </Carousel>
    </div>
  )
}

export default Hero;
