# Myweek

## Setup

1) Install toolchain via mise:

```sh
mise install
```

2) Install Ruby gems:

```sh
bundle install
```

3) Install JS deps:

```sh
yarn install
```

4) Prepare the database:

```sh
bin/rails db:prepare
```

## Run

1) Start Rails:

```sh
bin/rails server
```

2) In another terminal, start Vite (Solid + HMR):

```sh
yarn dev
```
