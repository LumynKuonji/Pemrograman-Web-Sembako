import os
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent

SYSTEM_PROMPT = """Anda adalah asisten virtual Toko Sembako yang ramah dan membantu.
Bantu pelanggan dengan:
- Rekomendasi produk sembako (beras, minyak, mie, bumbu, minuman, dll.)
- Cara berbelanja, keranjang, dan checkout di website
- Informasi umum toko sembako

Jawab singkat, jelas, dalam Bahasa Indonesia. Jika tidak tahu, arahkan ke Customer Service."""

# Default per provider (bisa ditimpa di config_ai.env)
PROVIDER_DEFAULTS = {
    "nvidia": {
        "base_url": "https://integrate.api.nvidia.com/v1",
        "model": "meta/llama-3.1-8b-instruct",
    },
    "openrouter": {
        "base_url": "https://openrouter.ai/api/v1",
        "model": "openai/gpt-4o-mini",
    },
    "9router": {
        "base_url": "http://localhost:20128/v1",
        "model": "gpt-4o-mini",
    },
}


def _parse_env_file(path: Path) -> dict:
    data = {}
    if not path.exists():
        return data
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        data[key.strip()] = value.strip().strip('"').strip("'")
    return data


def _load_file_config() -> dict:
    cfg = _parse_env_file(BACKEND_ROOT / "config_ai.env")
    legacy = _parse_env_file(BACKEND_ROOT / "config_9router.env")
    for key, value in legacy.items():
        if key not in cfg or not cfg[key]:
            cfg[key] = value
    return cfg


def normalize_nvidia_model(model: str) -> str:
    """
    NVIDIA NIM memakai format: organisasi/nama-model
    Contoh benar: qwen/qwen3-5-122b-a10b, meta/llama-3.1-8b-instruct
    """
    m = model.strip()
    if "/" in m:
        return m

    fixes = {
        "qwen3.5-122b-a10b": "qwen/qwen3-5-122b-a10b",
        "qwen3-5-122b-a10b": "qwen/qwen3-5-122b-a10b",
        "qwen3.5-397b-a17b": "qwen/qwen3.5-397b-a17b",
    }
    key = m.lower()
    if key in fixes:
        return fixes[key]

    lower = m.lower()
    if lower.startswith("qwen"):
        return f"qwen/{m}"
    if lower.startswith("meta-"):
        return f"meta/{m[5:]}" if not lower.startswith("meta/") else m
    if lower.startswith("llama"):
        return f"meta/{m}"

    return m


def list_nvidia_models(api_key: str, base_url: str):
    """Ambil daftar model dari NVIDIA (untuk debug)."""
    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key, base_url=base_url)
        models = client.models.list()
        return [getattr(x, "id", str(x)) for x in models.data], None
    except Exception as exc:
        return None, str(exc)


def get_ai_config():
    """
    Provider: nvidia | openrouter | 9router | custom
    File: BackEnd/config_ai.env
    """
    file_cfg = _load_file_config()

    provider = (
        os.environ.get("AI_PROVIDER")
        or file_cfg.get("AI_PROVIDER")
        or "nvidia"
    ).strip().lower()

    defaults = PROVIDER_DEFAULTS.get(provider, {})

    base_url = os.environ.get("AI_BASE_URL") or file_cfg.get("AI_BASE_URL") or defaults.get("base_url", "")
    api_key = os.environ.get("AI_API_KEY") or file_cfg.get("AI_API_KEY", "")
    model = os.environ.get("AI_MODEL") or file_cfg.get("AI_MODEL") or defaults.get("model", "meta/llama-3.1-8b-instruct")

    if not api_key:
        api_key = os.environ.get("NINEROUTER_API_KEY") or file_cfg.get("NINEROUTER_API_KEY", "")
    if not base_url:
        base_url = os.environ.get("NINEROUTER_BASE_URL") or file_cfg.get("NINEROUTER_BASE_URL", "")

    base_url = base_url.strip().rstrip("/")
    if base_url and not base_url.endswith("/v1"):
        base_url = f"{base_url}/v1"

    model = model.strip()
    if provider == "nvidia":
        model = normalize_nvidia_model(model)

    return provider, base_url, api_key.strip(), model


def get_9router_config():
    _, base_url, api_key, model = get_ai_config()
    return base_url, api_key, model


def is_configured():
    _, base_url, api_key, _ = get_ai_config()
    return bool(base_url and api_key)


def _provider_label(provider: str) -> str:
    labels = {
        "nvidia": "NVIDIA NIM",
        "openrouter": "OpenRouter",
        "9router": "9Router",
    }
    return labels.get(provider, "AI")


def chat_completion(messages: list, user_name: str = "Pelanggan"):
    provider, base_url, api_key, model = get_ai_config()
    label = _provider_label(provider)

    if not base_url or not api_key:
        return None, (
            "Chatbot belum dikonfigurasi. Isi AI_API_KEY di BackEnd/config_ai.env "
            "(NVIDIA: https://build.nvidia.com)"
        )

    try:
        from openai import OpenAI
    except ImportError:
        return None, "Library openai belum terpasang. Jalankan: pip install -r requirements.txt"

    extra_headers = None
    if provider == "openrouter":
        extra_headers = {
            "HTTP-Referer": os.environ.get("AI_SITE_URL", "http://localhost:5000"),
            "X-Title": os.environ.get("AI_SITE_NAME", "Toko Sembako"),
        }

    client = OpenAI(
        api_key=api_key,
        base_url=base_url,
        default_headers=extra_headers,
    )

    system = SYSTEM_PROMPT + f"\nNama pelanggan saat ini: {user_name}."
    api_messages = [{"role": "system", "content": system}]

    for msg in messages[-20:]:
        role = msg.get("role")
        content = (msg.get("content") or "").strip()
        if role in ("user", "assistant") and content:
            api_messages.append({"role": role, "content": content})

    if len(api_messages) < 2:
        return None, "Pesan tidak boleh kosong"

    try:
        response = client.chat.completions.create(
            model=model,
            messages=api_messages,
            temperature=0.7,
            max_tokens=1024,
        )
        reply = response.choices[0].message.content
        return reply, None
    except Exception as exc:
        err = str(exc)
        if "Connection" in err or "connect" in err.lower():
            hints = {
                "nvidia": "Periksa https://integrate.api.nvidia.com/v1 dan API key dari build.nvidia.com",
                "openrouter": "Periksa https://openrouter.ai/api/v1 dan koneksi internet",
                "9router": "Pastikan 9Router berjalan di http://localhost:20128/v1",
            }
            hint = hints.get(provider, "Periksa AI_BASE_URL dan koneksi")
            return None, f"Tidak dapat terhubung ke {label}. {hint}"
        if provider == "nvidia" and (
            "model" in err.lower() or "404" in err or "not found" in err.lower()
        ):
            return None, (
                f"Model '{model}' tidak dikenali NVIDIA NIM. "
                "Format benar: qwen/qwen3-5-122b-a10b (ada prefix qwen/ dan pakai tanda - bukan .). "
                "Lihat daftar: GET /api/chat/models atau https://build.nvidia.com/explore/discover"
            )
        return None, f"Error {label}: {err}"
