# TPM Nest

This repository contains a control server written in
NestJS as a companion software for
[this Tree Parity Machine implementation](https://github.com/lavidaesrecorta/Tree-Parity-Machines).

## Features

The development is active, and new features are being developed
in order to facilitate debugging, and research.
Some features are yet to be fully tested.

### Current features

- Multi-Device Sync (Untested for more than two devices).
- Event-oriented control.
- Mass stimulation and training
- On screen logging of iteration events, on stimulation and training.

### Planned features

- Device health-check on timeout.
- Automatic pause/stop on device fatal error.
- Push iteration and sync statistics to InfluxDB
- Change logging system to winston-loki
- Create Grafana integrations to easily control and change the training parameters.
- Ability to setup additional serial connections to specific devices with a wired link to the system.

## Installation

Clone into a folder and install dependencies with yarn.

```bash
  yarn install
```

## Usage/Examples

Run the app with

```bash
yarn run start
```

The control server must start before the devices, for now the devices
do not try to reconnect.

Once the app has started, and the devices have been connected, training can be started with the by creating a POST request to the following endpoint:

```
https://{SERVER_IP}:3000/controlpanel/tpm-init
```

And specify the training parameters in the body of the request with the following structure:

```json
{
  "k": number,
  "n": number,
  "l": number,
  "learnRule": 0 | 1 | 2
}
```

With `k` hidden units, `n` number of input neurons and `l` range of discrete weights.
There are three `learnRules`:

- 0: Hebbian learning rule
- 1: Anti-Hebbian learning rule
- 2: Random-Walk learning rule

After initializing the system, synchronization status is available in the server console.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

License in discussion. You are explicitly forbidden to redistribute this code without linking to this repository or resell it under any circumstance. You may download, modify and run this code for research purposes only.
