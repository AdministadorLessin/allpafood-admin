import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

const MAX_WAYPOINTS = 23;

const chunkArray = (array, size) => {

    const result = [];

    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }

    return result;
};

const MotorizadoDirectionsIrvin = ({
    points,
    setOrderedPoints
}) => {

    const map = useMap();

    const renderersRef = useRef([]);

    useEffect(() => {

        if (!map) return;
        if (!points || points.length < 2) return;
        if (!window.google?.maps) return;

        // limpiar rutas anteriores
        renderersRef.current.forEach(renderer => {
            renderer.setMap(null);
        });

        renderersRef.current = [];

        const directionsService =
            new window.google.maps.DirectionsService();

        const optimizeAndDraw = async () => {

            try {

                // primer punto = central
                const originPoint = points[0];

                // puntos reales a ordenar
                let remainingPoints = [...points.slice(1)];

                let finalOrderedPoints = [];

                let currentOrigin = originPoint;

                while (remainingPoints.length > 0) {

                    // tomar bloque
                    const chunk =
                        remainingPoints.slice(0, MAX_WAYPOINTS);

                    // construir puntos completos del tramo
                    const routePoints = [
                        currentOrigin,
                        ...chunk
                    ];

                    const result =
                        await new Promise((resolve, reject) => {

                            directionsService.route(
                                {
                                    origin: routePoints[0],

                                    destination:
                                        routePoints[
                                            routePoints.length - 1
                                        ],

                                    waypoints: routePoints
                                        .slice(1, -1)
                                        .map(item => ({
                                            location: {
                                                lat: item.lat,
                                                lng: item.lng
                                            },
                                            stopover: true
                                        })),

                                    optimizeWaypoints: true,

                                    travelMode:
                                        window.google.maps.TravelMode.DRIVING
                                },
                                (result, status) => {

                                    if (status === 'OK') {
                                        resolve(result);
                                    } else {
                                        reject(status);
                                    }
                                }
                            );
                        });

                    // obtener orden optimizado
                    const waypointOrder =
                        result.routes[0].waypoint_order;

                    // ordenar chunk
                    const orderedChunk =
                        waypointOrder.map(index => chunk[index]);

                    // agregar resultado final
                    finalOrderedPoints = [
                        ...finalOrderedPoints,
                        ...orderedChunk
                    ];

                    const routeColors = [
                        '#2563eb',
                        '#16a34a',
                        '#dc2626',
                        '#ca8a04',
                        '#9333ea',
                        '#ea580c',
                        '#0891b2',
                        '#db2777'
                    ];

                    const renderer =
                        new window.google.maps.DirectionsRenderer({
                            suppressMarkers: true,
                            polylineOptions: {
                                strokeColor:
                                    routeColors[
                                        renderersRef.current.length %
                                        routeColors.length
                                    ],
                                strokeWeight: 5
                            }
                        });

                    renderer.setMap(map);

                    renderer.setDirections(result);

                    renderersRef.current.push(renderer);

                    // IMPORTANTISIMO:
                    // nuevo origen = ultimo punto REAL optimizado
                    currentOrigin =
                        orderedChunk[
                            orderedChunk.length - 1
                        ];

                    // remover puntos usados
                    remainingPoints =
                        remainingPoints.slice(MAX_WAYPOINTS);
                }

                console.log(
                    'RUTA ORDENADA',
                    finalOrderedPoints
                );

                // retornar lista ordenada al padre
                if (setOrderedPoints) {
                    setOrderedPoints(finalOrderedPoints);
                }

            } catch (error) {

                console.error(
                    'DIRECTIONS ERROR:',
                    error
                );
            }
        };

        optimizeAndDraw();

        return () => {

            renderersRef.current.forEach(renderer => {
                renderer.setMap(null);
            });
        };

    }, [map, points]);

    return null;
};

export default MotorizadoDirectionsIrvin;