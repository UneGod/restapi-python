from pydantic_settings import BaseSettings, SettingsConfigDict

class jwtsett(BaseSettings):
    JWT_SECRET_KEY: str

    model_config = SettingsConfigDict(env_file=".env")

setings = jwtsett()