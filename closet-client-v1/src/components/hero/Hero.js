import './Hero.css'
import Carousel from 'react-material-ui-carousel'
import { Paper } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlay } from '@fortawesome/free-solid-svg-icons'
import { Link , useNavigate} from 'react-router-dom'
import { Button } from 'react-bootstrap'

 const Hero = ({closets}) => {

    const navigate = useNavigate();

    function coats(closetId){
        navigate(`/Coats/${closetId}`);
    }

  return (
    <div>
        <Carousel className='closet-carousel-container'>
            {
                closets.map((closet) =>{
                     return (
                        <Paper key={closet.id}>
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
                                            <div className='closet-coat-button-container'>
                                                <Button variant="info" onClick={() => coats(closet.id)}>Coats</Button>
                                            </div>
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
