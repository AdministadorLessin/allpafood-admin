import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

const MotorizadoDirections = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length < 2) return;
    if (!window.google?.maps) return;

    const directionsService =
      new window.google.maps.DirectionsService();

    const directionsRenderer =
      new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#2563eb',
          strokeWeight: 5
        }
      });

    directionsRenderer.setMap(map);

    directionsService.route(
      {
        origin: points[0],
        destination: points[points.length - 1],
        waypoints: points.slice(1, -1).map(p => ({
          location: p,
          stopover: true
        })),
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
        } else {
          console.error('DIRECTIONS ERROR:', status);
        }
      }
    );

    return () => directionsRenderer.setMap(null);
  }, [map, points]);

  return null;
};

export default MotorizadoDirections;