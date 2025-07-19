{
  lib,
  dream2nix,
  ...
}: let
  packageJSON = builtins.fromJSON (builtins.readFile ./game-grid/package.json);
  dataUrl = builtins.getEnv "DATA_URL";
in {
  inherit (packageJSON) name version;

  imports = [
    dream2nix.modules.dream2nix.nodejs-package-lock-v3
    dream2nix.modules.dream2nix.nodejs-granular-v3
  ];

  nodejs-package-lock-v3.packageLockFile = ./game-grid/package-lock.json;
  nodejs-granular-v3 = {
    installMethod = "symlink";
    buildScript = ''
      DATA_URL=${dataUrl} npm run build
    '';
  };
  mkDerivation = {
    src = lib.cleanSource ./game-grid;
    doCheck = false; # TODO: Create offline tests
    passthru.meta = {
      description = "Simple web app using";
      longDescription = ''
        Web root available at "''\${game-grid}/lib/node_modules/game-grid/dist"
      '';
    };
  };
}
