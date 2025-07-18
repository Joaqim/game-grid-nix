{
  lib,
  dream2nix,
  ...
}: let
  packageJSON = builtins.fromJSON (builtins.readFile ./game-grid/package.json);
in {
  inherit (packageJSON) name version;

  imports = [
    dream2nix.modules.dream2nix.nodejs-package-lock-v3
    dream2nix.modules.dream2nix.nodejs-granular-v3
  ];

  nodejs-package-lock-v3.packageLockFile = ./game-grid/package-lock.json;
  nodejs-granular-v3.installMethod = "symlink";

  mkDerivation = {
    src = lib.cleanSource ./game-grid;
    checkPhase = ''
      npm run test
    '';
    doCheck = false; # TODO: Create offline tests
    passthru.meta = {
      description = "Sample express node app using Dream2nix";
      mainProgram = "game-grid";
    };
  };
}
