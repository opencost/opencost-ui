[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

# OpenCost UI

<img src="src/images/logo.png"/>

This is the web UI for the [OpenCost](http://github.com/opencost/opencost) project. You can learn more about the [User Interface](https://www.opencost.io/docs/installation/ui) in the OpenCost docs.

[![OpenCost UI Walkthrough](./src/thumbnail.png)](https://youtu.be/lCP4Ci9Kcdg)
*OpenCost UI Walkthrough*

## Installing

See [Installation Guide](https://opencost.io/docs/installation/install) for the full instructions.

## Using

After following the installation instructions, access the UI by port forwarding:
```
kubectl port-forward --namespace opencost service/opencost 9090
```

## Running Locally

The UI can be run locally using the `npm run serve` command.

```sh
$ npm install
...
$ npm run serve
> opencost-ui@0.1.0 serve
> npx parcel serve src/index.html

Server running at http://localhost:1234
✨ Built in 1.96s
```

### Development Without Backend

For development and testing without running the OpenCost backend server, you can enable mock data mode:

```sh
# Windows PowerShell
$env:REACT_APP_USE_MOCK_DATA="true"; npm run serve

# Linux/macOS
REACT_APP_USE_MOCK_DATA=true npm run serve
```

This will use realistic mock data for all API endpoints, allowing you to develop and test UI features without connecting to an actual OpenCost server.

### OpenCost API Documentation

The UI consumes the following OpenCost APIs:

- **[Allocation API](https://docs.kubecost.com/apis/monitoring-apis/allocation-api)** - Cost allocation data by pod, namespace, etc.
- **[Assets API](https://docs.kubecost.com/apis/monitoring-apis/assets-api)** - Infrastructure cost data (nodes, disks, load balancers)
  - `/model/assets` - Retrieve backing cost data by individual assets
  - `/model/assets/topline` - Condensed overview of total cost metrics
  - `/model/assets/diff` - Compare asset changes between two time windows
- **[Cloud Cost API](https://docs.kubecost.com/apis/monitoring-apis/cloud-cost-api)** - Cloud provider billing data

### Custom Backend URL

And can have a custom URL backend prefix.

```sh
BASE_URL=http://localhost:9090/test npm run serve

> opencost-ui@0.1.0 serve
> npx parcel serve src/index.html

Server running at http://localhost:1234
✨ Built in 772ms
```

In addition, similar behavior can be replicated with the docker container:

```sh
$ docker run -e BASE_URL_OVERRIDE=test -p 9091:9090 -d opencost-ui:latest
$ curl localhost:9091
<html gibberish>
```

## Overriding the Base API URL

For some use cases such as the case of [OpenCost deployed behind an ingress controller](https://github.com/opencost/opencost/issues/1677), it is useful to override the `BASE_URL` variable responsible for requests sent from the UI to the API.  This means that instead of sending requests to `<domain>/model/allocation/compute/etc`, requests can be sent to `<domain>/{BASE_URL_OVERRIDE}/allocation/compute/etc`.  To do this, supply the environment variable `BASE_URL_OVERRIDE` to the docker image.

```sh
$ docker run -p 9091:9090 -e BASE_URL_OVERRIDE=anything -d opencost-ui:latest
```

## Overriding the Base UI URL Path

To serve the web interface under a path other than the root (`/`), you need to build a custom image using the `ui_path` build argument.  
For example, you can clone this project and run:

```sh
$ docker build --build-arg ui_path=/anything --tag opencost-ui:latest .
```

This ensures that all static assets are served from the specified path.

Once the container is running, the UI will be accessible at `<domain>/{ui_path}`.
