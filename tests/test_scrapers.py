from utils.data_cleaner import clean_text


def test_clean_text_normalizes_whitespace() -> None:
    assert clean_text("  arte   e\n moda ") == "arte e moda"