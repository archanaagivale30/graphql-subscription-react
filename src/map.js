import React from "react";
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import {
  withGoogleMap,
  withScriptjs,
  GoogleMap,
  Polyline,
  Marker
} from "react-google-maps";

class Map extends React.Component {

  constructor() {
    super();
    this.state = {
      path: []
    }
  }
  query = gql`
   {
     VehicleLocation{
          id lat lng
       }
    }`;

    subscription = gql`
    subscription{
      newVehicleLocation{
        lat lng
      }
    }
  `;

  render = () => {
    return (
      <Query query={this.query}>
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) return <p>Loading...</p>;
          const more = () => subscribeToMore({
            document: this.subscription,
            updateQuery: (prev, { subscriptionData }) => {
              if (!subscriptionData.data) return prev;
              const { newVehicleLocation } = subscriptionData.data;
              let oldPath = this.state.path;
              oldPath.push(newVehicleLocation);
              this.setState({ path: [...oldPath] })
            },
          });
          return <MapView path={this.state.path} subscribeToMore={more} />;

        }}
      </Query>
    );
  };
}

const MapComponent = withScriptjs(withGoogleMap(Map));

export default () => (
  <MapComponent
    googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
    loadingElement={<div style={{ height: `100%` }} />}
    containerElement={<div style={{ height: `800px`, width: "100" }} />}
    mapElement={<div style={{ height: `100%` }} />}
  />
);



const MapView = class extends React.PureComponent {
  componentDidMount() {
    this.props.subscribeToMore();
  }
  render() {
    const { path } = this.props;
    console.log(path)
    return (
      <GoogleMap
        defaultZoom={14}
        defaultCenter={{ lat: 18.559008, lng: -68.388881 }}
      >
        <Polyline path={path} options={{ strokeColor: "#FF0000 " }} />
        <Marker position={path[path.length - 1]} />
      </GoogleMap>
    );
  }
};