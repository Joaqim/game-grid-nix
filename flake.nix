{
  inputs = {
    dream2nix = {
      url = "github:nix-community/dream2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    systems.url = "github:nix-systems/default";
  };
  outputs = inputs @ {
    dream2nix,
    flake-parts,
    systems,
    nixpkgs,
    ...
  }:
    flake-parts.lib.mkFlake {inherit inputs;} {
      systems = import systems;
      perSystem = {
        lib,
        pkgs,
        system,
        self',
        ...
      }: {
        packages = let
          evalModules = module:
            dream2nix.lib.evalModules {
              packageSets.nixpkgs = nixpkgs.legacyPackages.${system};
              modules = [
                module
                {
                  paths.projectRoot = ./.;
                  paths.projectRootFile = "flake.nix";
                  paths.package = ./.;
                }
              ];
            };
        in {
          game-grid = evalModules ./default.nix;
          default = self'.packages.game-grid;
        };
      };
    };
}
