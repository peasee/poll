fmt:
	cargo fmt
	cargo sort --workspace

fix: fmt
	cargo fix --all-targets --all-features --allow-dirty --allow-no-vcs
	cargo clippy --fix --all-targets --all-features --no-deps --allow-dirty --allow-no-vcs -- -D warnings