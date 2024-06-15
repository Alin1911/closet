import './Hero.css'
import Carousel from 'react-material-ui-carousel'
import { Paper } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlay } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'

 const Hero = ({closets}) => {
  return (
    <div>
        <Carousel className='closet-carousel-container'>
            {
                closets.map((closet) =>{
                     return (
                        <Paper key={closet.imdbId}>
                            <div className='closet-carousel-container'>
                                <div className='closet-card' style={{"--img": `url(${closet.backdrops[0]})`}}>
                                    <div className='closet-detail'>
                                        <div className='closet-poster'>
                                            <img src={closet.poster} alt="" />
                                        </div>
                                        <div className='closet-title'>
                                            <h3>{closet.title}</h3>
                                        </div>
                                        <div className='closet-button-container'>
                                            <Link to={`/Trailer/${closet.trailerLink.substring(closet.trailerLink.length -11)}`}>
                                                <div className='play-button-icon-container'>
                                                    <FontAwesomeIcon className='play-button-icon'
                                                        icon={faCirclePlay}
                                                    />
                                                </div>
                                            </Link>
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
