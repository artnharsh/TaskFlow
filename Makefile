PORT=8000

install:
	npm --prefix backend install

dev:
	npm --prefix backend run dev

test:
	npm --prefix backend test

lint:
	npm --prefix backend run lint

format:
	npm --prefix backend run format

register:
	http POST :$(PORT)/api/auth/register \
	name=madmax \
	email=madmax@gmail.com \
	password=123123

login:
	http POST :$(PORT)/api/auth/login \
	email=madmax@gmail.com \
	password=123123

me:
	http GET :$(PORT)/api/auth/me \
	Authorization:"Bearer $(TOKEN)"

