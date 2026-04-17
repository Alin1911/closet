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
        navigate(`/coats/${closetId}`);
    }

  return (
    <div>
        <Carousel className='closet-carousel-container'>
            {
                closets.map((closet) =>{
                    const coverImage = closet.images?.[0] || closet.backdrops?.[0] || '';
                    const trailerId = closet.trailerLink ? closet.trailerLink.substring(closet.trailerLink.length -11) : null;
                    const title = closet.name || closet.title || 'Closet';
                     return (
                        <Paper key={closet.id}>
                            <div className='closet-carousel-container'>
                                <div className='closet-card' style={{"--img": `url(${coverImage})`}}>
                                    <div className='closet-detail'>
                                        <div className='closet-poster'>
                                            <img src={closet.poster} alt="" />
                                        </div>
                                        <div className='closet-title'>
                                            <h3>{title}</h3>
                                        </div>
                                        <div className='closet-button-container'>
                                            {trailerId ? (
                                            <Link to={`/trailer/${trailerId}`} aria-label='Watch lookbook'>
                                                <div className='play-button-icon-container'>
                                                    <FontAwesomeIcon className='play-button-icon'
                                                        icon={faCirclePlay}
                                                    />
                                                    <span className='lookbook-label'>Watch lookbook</span>
                                                </div>
                                            </Link>
                                            ) : null}
                                            <div className='closet-coat-button-container'>
                                                <Button variant="info" className='closet-action-btn' onClick={() => coats(closet.id)}>View items</Button>
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
