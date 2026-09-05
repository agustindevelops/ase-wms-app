import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BUILDS = ROOT / "builds"


def latest_aab() -> Path:
    aabs = list(BUILDS.glob("build-*.aab"))
    if not aabs:
        raise SystemExit("No builds/build-*.aab found. Run App Build first.")
    return max(aabs, key=lambda p: int(p.stem.split("-", 1)[1]))


def load_dotenv(path: Path, env: dict[str, str]) -> None:
    if not path.exists():
        raise SystemExit(f"Missing {path.name}. Add EXPO_PUBLIC_ASE_WIS_API_URL there.")
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key.strip()] = value.strip().strip("'").strip('"')


def command(name: str) -> tuple[str, dict[str, str]]:
    env = os.environ.copy()
    if name == "dev":
        return "npx expo start --dev-client", env
    if name == "build":
        load_dotenv(ROOT / ".env.prod", env)
        BUILDS.mkdir(exist_ok=True)
        output = BUILDS / f"build-{int(time.time() * 1000)}.aab"
        return (
            "npx eas-cli build --platform android --profile production --local "
            f'--output "{output}"',
            env,
        )
    if name == "push":
        aab = latest_aab()
        print(f"Submitting {aab}")
        return (
            "npx eas-cli submit --platform android --profile production "
            f'--path "{aab}"',
            env,
        )
    raise SystemExit(f"Unknown command: {name}")


if __name__ == "__main__":
    cmd, env = command(sys.argv[1])
    raise SystemExit(subprocess.call(cmd, shell=True, cwd=ROOT, env=env))
